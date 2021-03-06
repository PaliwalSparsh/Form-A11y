// @ts-nocheck
import React, { useContext, useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { PDFPageProxy } from 'pdfjs-dist/types/display/api';

import {
    PDFPageInfo,
    AnnotationStore,
    ToolStore,
    toolType,
    PDFStore,
    Bounds,
    normalizeBounds,
    getNewAnnotation,
} from '../context';
import { Selection } from '../components';
import { SelectionBoundary, SelectionTokens } from './Selection';

class PDFPageRenderer {
    private currentRenderTask?: ReturnType<PDFPageProxy['render']>;
    constructor(
        readonly page: PDFPageProxy,
        readonly canvas: HTMLCanvasElement,
        readonly onError: (e: Error) => void
    ) {}

    cancelCurrentRender() {
        if (this.currentRenderTask === undefined) {
            return;
        }
        this.currentRenderTask.promise.then(
            () => {},
            (err: any) => {
                if (err instanceof Error && err.message.indexOf('Rendering cancelled') !== -1) {
                    // Swallow the error that's thrown when the render is canceled.
                    return;
                }
                const e = err instanceof Error ? err : new Error(err);
                this.onError(e);
            }
        );
        this.currentRenderTask.cancel();
    }

    render(scale: number) {
        const viewport = this.page.getViewport({ scale });

        this.canvas.height = viewport.height;
        this.canvas.width = viewport.width;

        // get canvas for making changes to it.
        const canvasContext = this.canvas.getContext('2d');
        if (canvasContext === null) {
            throw new Error('No canvas context');
        }
        this.currentRenderTask = this.page.render({ canvasContext, viewport });
        return this.currentRenderTask;
    }

    rescaleAndRender(scale: number) {
        this.cancelCurrentRender();
        return this.render(scale);
    }
}

function getPageBoundsFromCanvas(canvas: HTMLCanvasElement): Bounds {
    if (canvas.parentElement === null) {
        throw new Error('No canvas parent');
    }
    const parent = canvas.parentElement;
    const parentStyles = getComputedStyle(canvas.parentElement);

    const leftPadding = parseFloat(parentStyles.paddingLeft || '0');
    const left = parent.offsetLeft + leftPadding;

    const topPadding = parseFloat(parentStyles.paddingTop || '0');
    const top = parent.offsetTop + topPadding;

    const parentWidth =
        parent.clientWidth - leftPadding - parseFloat(parentStyles.paddingRight || '0');
    const parentHeight =
        parent.clientHeight - topPadding - parseFloat(parentStyles.paddingBottom || '0');
    return {
        left,
        top,
        right: left + parentWidth,
        bottom: top + parentHeight,
    };
}

interface PageProps {
    pageInfo: PDFPageInfo;
    onError: (_err: Error) => void;
}

const Page = ({ pageInfo, onError }: PageProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [scale, setScale] = useState<number>(1);

    const annotationStore = useContext(AnnotationStore);
    const toolStore = useContext(ToolStore);

    const containerRef = useRef<HTMLDivElement>(null);
    // this selection is not the selectedAnnotations. This is the selection box that is drawn on the page.
    const [selection, setSelection] = useState<Bounds>();

    const annotations = annotationStore.pdfAnnotations.annotations.filter(
        (a) => a.page === pageInfo.page.pageNumber - 1
    );

    useEffect(() => {
        try {
            // check if a page is in view might be used for performance and not rendering everything at once.
            const determinePageVisiblity = () => {
                if (canvasRef.current !== null) {
                    const windowTop = 0;
                    const windowBottom = window.innerHeight;
                    const rect = canvasRef.current.getBoundingClientRect();
                    setIsVisible(
                        // Top is in within window
                        (windowTop < rect.top && rect.top < windowBottom) ||
                            // Bottom is in within window
                            (windowTop < rect.bottom && rect.bottom < windowBottom) ||
                            // top is negative and bottom is +ve
                            (rect.top < windowTop && rect.bottom > windowTop)
                    );
                }
            };

            if (canvasRef.current === null) {
                onError(new Error('No canvas element'));
                return;
            }
            // this gets bound for parent element not page. In the original codebase the parent was the page.
            pageInfo.bounds = getPageBoundsFromCanvas(canvasRef.current);

            const renderer = new PDFPageRenderer(pageInfo.page, canvasRef.current, onError);
            // the reasoning behind scale is present in the PDFStore.tsx file.
            renderer.render(pageInfo.scale);

            determinePageVisiblity();

            const handleResize = () => {
                if (canvasRef.current === null) {
                    onError(new Error('No canvas element'));
                    return;
                }
                // it gives x, y, width, height of the DOM element bounds.
                pageInfo.bounds = getPageBoundsFromCanvas(canvasRef.current);
                renderer.rescaleAndRender(pageInfo.scale);
                setScale(pageInfo.scale);
                determinePageVisiblity();
            };

            window.addEventListener('resize', handleResize);
            window.addEventListener('scroll', determinePageVisiblity);
            return () => {
                window.removeEventListener('resize', handleResize);
                window.removeEventListener('scroll', determinePageVisiblity);
            };
        } catch (e) {
            onError(e);
        }
    }, [pageInfo, onError]); // We deliberately only run this once.

    const toolProperties = {
        [toolType.ARROW]: {
            onMouseDown: (event) => {
                if (containerRef.current === null) {
                    throw new Error('No Container');
                }
                if (!selection) {
                    const left = event.pageX - containerRef.current.offsetLeft;
                    const top = event.pageY - containerRef.current.offsetTop;
                    setSelection({
                        left,
                        top,
                        right: left,
                        bottom: top,
                    });
                }
            },
            onMouseMove: (event) => {
                if (selection) {
                    if (containerRef.current === null) {
                        throw new Error('No Container');
                    }
                    setSelection({
                        ...selection,
                        right: event.pageX - containerRef.current.offsetLeft,
                        bottom: event.pageY - containerRef.current.offsetTop,
                    });
                }
            },
            onMouseUp: () => {
                if (selection) {
                    // activeLabel can be set to Textbox, checkbox, radio, etc. in the sidebar. Then it is used when new annotations are created.
                    if (annotationStore.activeLabel) {
                        const newAnnotation = getNewAnnotation(
                            // TODO(Mark): Change
                            pageInfo,
                            selection,
                            annotationStore.activeLabel,
                            annotationStore.freeFormAnnotations
                        );
                        if (newAnnotation) {
                            annotationStore.setPdfAnnotations(
                                annotationStore.pdfAnnotations.withNewAnnotation(newAnnotation)
                            );
                            // newly created annotation is selected.
                            annotationStore.setSelectedAnnotations([newAnnotation]);
                        } else {
                            // if no new annotation is created, then we need to clear the selection.
                            annotationStore.setSelectedAnnotations([]);
                        }
                    }
                    // After the annotation is created, we reset the selection.
                    setSelection(undefined);
                }
            },
        },
    };

    const currentToolProperties = toolProperties[toolStore.currentTool];

    return (
        <PageAnnotationsContainer
            ref={containerRef}
            onMouseDown={currentToolProperties?.onMouseDown}
            onMouseMove={currentToolProperties?.onMouseMove}
            onMouseUp={currentToolProperties?.onMouseUp}>
            <PageCanvas ref={canvasRef} />
            {
                // We only render the tokens if the page is visible, as rendering them all makes the
                // page slow and/or crash.
                // This is where annotations are rendered.
                scale &&
                    isVisible &&
                    annotations.map((annotation) => (
                        <Selection
                            pageInfo={pageInfo}
                            annotation={annotation}
                            key={annotation.toString()}
                        />
                    ))
            }
            {selection && annotationStore.activeLabel
                ? (() => {
                      if (selection && annotationStore.activeLabel) {
                          const annotation = pageInfo.getAnnotationForBounds(
                              normalizeBounds(selection),
                              annotationStore.activeLabel
                          );
                          const tokens =
                              annotation &&
                              annotation.tokens &&
                              !annotationStore.freeFormAnnotations
                                  ? annotation.tokens
                                  : null;

                          return (
                              <>
                                  <SelectionBoundary
                                      color={annotationStore.activeLabel.color}
                                      bounds={selection}
                                      selected={false}
                                  />
                                  <SelectionTokens pageInfo={pageInfo} tokens={tokens} />
                              </>
                          );
                      }
                  })()
                : null}
            {/* TODO(Sparsh): This is where all form annotations will be rendered.} */}
        </PageAnnotationsContainer>
    );
};

export const PDF = () => {
    const pdfStore = useContext(PDFStore);

    // TODO (@codeviking): Use error boundaries to capture these.
    if (!pdfStore.doc) {
        throw new Error('No Document');
    }
    if (!pdfStore.pages) {
        throw new Error('Document without Pages');
    }

    return (
        <>
            {pdfStore.pages.map((p) => {
                return <Page key={p.page.pageNumber} pageInfo={p} onError={pdfStore.onError} />;
            })}
        </>
    );
};

const PageAnnotationsContainer = styled.div`
    position: relative;

    &:last-child {
        margin-bottom: 0;
    }
`;

const PageCanvas = styled.canvas`
    display: block;
`;
