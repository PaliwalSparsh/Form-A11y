// @ts-nocheck

import React, { MouseEvent, useContext, useState, useEffect } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { Modal, Select } from '@allenai/varnish';

import {
    Bounds,
    TokenId,
    PDFPageInfo,
    Annotation,
    AnnotationStore,
    ToolStore,
    toolType,
} from '../context';
import { EditFilled } from '@ant-design/icons';
import { ActionMenu } from './formA11y';

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        throw new Error('Unable to parse color.');
    }
    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    };
}

function getBorderWidthFromBounds(bounds: Bounds): number {
    //
    const width = bounds.right - bounds.left;
    const height = bounds.bottom - bounds.top;
    if (width < 100 || height < 100) {
        return 1;
    } else {
        return 3;
    }
}

interface SelectionBoundaryProps {
    color: string;
    bounds: Bounds;
    selected: boolean;
    children?: React.ReactNode;
    annotationId?: string;
    onClick?: () => void;
}

export const SelectionBoundary = ({
    color,
    bounds,
    children,
    onClick = () => {},
    onMouseDown = () => {},
    onMouseMove = () => {},
    onMouseUp = () => {},
    selected,
}: SelectionBoundaryProps) => {
    const width = bounds.right - bounds.left;
    const height = bounds.bottom - bounds.top;
    const rotateY = width < 0 ? -180 : 0;
    const rotateX = height < 0 ? -180 : 0;
    const rgbColor = hexToRgb(color);
    const border = getBorderWidthFromBounds(bounds);

    return (
        <span
            onClick={(e) => {
                // Here we are preventing the default PdfAnnotationsContainer
                // behaviour of drawing a new bounding box if the shift key
                // is pressed in order to allow users to select multiple
                // annotations and associate them together with a relation.
                // We passed event to the onClick handler where this component is used.
                onClick(e);
                e.stopPropagation();
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            // this place holds logic for the appearance of selected element.
            style={{
                position: 'absolute',
                left: `${bounds.left}px`,
                top: `${bounds.top}px`,
                width: `${Math.abs(width)}px`,
                height: `${Math.abs(height)}px`,
                transform: `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
                transformOrigin: 'top left',
                border: `${border}px solid ${color}`,
                background: `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${
                    selected ? 0.3 : 0.1
                })`,
            }}>
            {children || null}
        </span>
    );
};

interface TokenSpanProps {
    isSelected?: boolean;
}

const TokenSpan = styled.span<TokenSpanProps>(
    ({ theme, isSelected }) => `
    position: absolute;
    background: ${isSelected ? theme.color.B3 : 'none'};
    opacity: 0.2;
    border-radius: 3px;
`
);

interface SelectionTokenProps {
    pageInfo: PDFPageInfo;
    tokens: TokenId[] | null;
}

export const SelectionTokens = ({ pageInfo, tokens }: SelectionTokenProps) => {
    return (
        <>
            {tokens &&
                tokens.map((t, i) => {
                    const b = pageInfo.getScaledTokenBounds(pageInfo.tokens[t.tokenIndex]);
                    return (
                        <TokenSpan
                            key={i}
                            isSelected={true}
                            style={{
                                left: `${b.left}px`,
                                top: `${b.top}px`,
                                width: `${b.right - b.left}px`,
                                height: `${b.bottom - b.top}px`,
                                // Tokens don't respond to pointerEvents because
                                // they are ontop of the bounding boxes and the canvas,
                                // which do respond to pointer events.
                                pointerEvents: 'none',
                            }}
                        />
                    );
                })}
        </>
    );
};

interface EditLabelModalProps {
    annotation: Annotation;
    onHide: () => void;
}

const EditLabelModal = ({ annotation, onHide }: EditLabelModalProps) => {
    const annotationStore = useContext(AnnotationStore);

    const [selectedLabel, setSelectedLabel] = useState(annotation.label);

    // There are onMouseDown listeners on the <canvas> that handle the
    // creation of new annotations. We use this function to prevent that
    // from being triggered when the user engages with other UI elements.
    const onMouseDown = (e: MouseEvent) => {
        e.stopPropagation();
    };

    useEffect(() => {
        const onKeyPress = (e: KeyboardEvent) => {
            // Ref to https://github.com/allenai/pawls/blob/0f3e5153241502eb68e46f582ed4b28112e2f765/ui/src/components/sidebar/Labels.tsx#L20
            // Numeric keys 1-9
            if (e.keyCode >= 49 && e.keyCode <= 57) {
                const index = Number.parseInt(e.key) - 1;
                if (index < annotationStore.labels.length) {
                    const selectedLabel = annotationStore.labels[index];
                    annotationStore.setPdfAnnotations(
                        annotationStore.pdfAnnotations
                            .deleteAnnotation(annotation)
                            .withNewAnnotation(annotation.update({ label: selectedLabel }))
                    );
                    onHide();
                }
            }
        };
        window.addEventListener('keydown', onKeyPress);
        return () => {
            window.removeEventListener('keydown', onKeyPress);
        };
    }, [annotationStore, annotation]);

    return (
        <Modal
            title="Edit Label"
            onCancel={onHide}
            onOk={() => {
                // Remove the annotation and add a copy with the updated label.
                // TODO: This might have side-effects to the relation mechanism.
                // Some additional testing is warranted.
                annotationStore.setPdfAnnotations(
                    annotationStore.pdfAnnotations
                        .deleteAnnotation(annotation)
                        .withNewAnnotation(annotation.update({ label: selectedLabel }))
                );
                onHide();
            }}
            cancelButtonProps={{ onMouseDown }}
            okButtonProps={{ onMouseDown }}
            visible>
            <Select<string>
                value={selectedLabel.text}
                onMouseDown={onMouseDown}
                onChange={(labelText) => {
                    const label = annotationStore.labels.find((l) => l.text === labelText);
                    if (!label) {
                        return;
                    }
                    setSelectedLabel(label);
                }}
                style={{ display: 'block' }}>
                {annotationStore.labels.map((l) => (
                    <Select.Option value={l.text} key={l.text}>
                        {l.text}
                    </Select.Option>
                ))}
            </Select>
        </Modal>
    );
};

interface SelectionProps {
    pageInfo: PDFPageInfo;
    annotation: Annotation;
    showInfo?: boolean;
}

export const Selection = ({
    pageInfo,
    annotation,
    showInfo = true,
    containerReference,
}: SelectionProps) => {
    const label = annotation.label;
    const theme = useContext(ThemeContext);

    const [isEditLabelModalVisible, setIsEditLabelModalVisible] = useState(false);
    const toolStore = useContext(ToolStore);
    const [mouseMovement, setMouseMovement] = useState();

    const annotationStore = useContext(AnnotationStore);

    let color;
    if (!label) {
        color = theme.color.N4.hex; // grey as the default.
    } else {
        color = label.color;
    }

    const bounds = pageInfo.getScaledBounds(annotation.bounds);
    // const border = getBorderWidthFromBounds(bounds);

    const removeAnnotations = () => {
        // This deletes all selected annotations. If only one annotation is selected it gets deleted.
        const allSelectedAnnotations = annotationStore.selectedAnnotations;
        let updatedAnnotation = annotationStore.pdfAnnotations;
        allSelectedAnnotations.forEach((selectedAnnotation) => {
            updatedAnnotation = updatedAnnotation.deleteAnnotation(selectedAnnotation);
        });
        // We do not call setState in a loop as react enqueues changes to the component
        // state. Calling setState in a loop gives you stale data.
        annotationStore.setPdfAnnotations(updatedAnnotation);
        annotationStore.setSelectedAnnotations([]);
    };

    const onClick = (e) => {
        // if shift is used do as pawls did earlier.
        if (e.shiftKey) {
            // slice(0) is used to create identical copy of an array.
            const current = annotationStore.selectedAnnotations.slice(0);

            // Current contains this annotation, so we remove it.
            if (current.some((other) => other.id === annotation.id)) {
                const next = current.filter((other) => other.id !== annotation.id);
                annotationStore.setSelectedAnnotations(next);
                // Otherwise we add it.
            } else {
                current.push(annotation);
                annotationStore.setSelectedAnnotations(current);
            }
        } else {
            // if shift is not used, we just add the currently selected annotation.
            annotationStore.setSelectedAnnotations([annotation]);
        }
    };

    const toolProperties = {
        [toolType.ARROW]: {
            onMouseDown: (e) => {
                if (!mouseMovement) {
                    const startX = e.pageX - containerReference?.current.offsetLeft;
                    const startY = e.pageY - containerReference?.current.offsetTop;
                    setMouseMovement({ startX, startY, endX: startX, endY: startY });
                }
            },
            onMouseMove: (e) => {
                if (mouseMovement) {
                    const endX = e.pageX - containerReference?.current.offsetLeft;
                    const endY = e.pageY - containerReference?.current.offsetTop;

                    const scaledDeltaX = pageInfo.scale * (endX - mouseMovement.startX);
                    const scaledDeltaY = pageInfo.scale * (endY - mouseMovement.startY);
                    console.log('annotation.bounds', annotation.bounds);

                    annotationStore.setPdfAnnotations(
                        annotationStore.pdfAnnotations
                            .deleteAnnotation(annotation)
                            .withNewAnnotation(
                                annotation.update({
                                    bounds: {
                                        bottom: annotation.bounds.bottom + scaledDeltaY,
                                        left: annotation.bounds.left + scaledDeltaX,
                                        right: annotation.bounds.right + scaledDeltaX,
                                        top: annotation.bounds.top + scaledDeltaY,
                                    },
                                })
                            )
                    );
                }
            },
            onMouseUp: () => {
                setMouseMovement(undefined);
            },
        },
    };

    const currentToolProperties = toolProperties[toolStore.currentTool];

    // Show selection for only the first selected annotation when multiple are selected.
    const isSelected = annotationStore.selectedAnnotations.includes(annotation);
    const totalSelections = annotationStore.selectedAnnotations.length;
    const firstSelection = annotationStore.selectedAnnotations[totalSelections - 1];
    const isFirstSelection = firstSelection && firstSelection.id === annotation.id;

    const showInfoAndLabels = showInfo && !annotationStore.hideLabels;

    return (
        <>
            <SelectionBoundary
                color={color}
                bounds={bounds}
                onMouseDown={currentToolProperties?.onMouseDown}
                onMouseMove={currentToolProperties?.onMouseMove}
                onMouseUp={currentToolProperties?.onMouseUp}
                onClick={onClick}
                selected={isSelected}>
                {showInfoAndLabels ? (
                    <>
                        {isFirstSelection && (
                            <ActionMenu.FieldLayer handleDelete={removeAnnotations} />
                        )}
                        <SelectionInformation>
                            <Label color={color}>{label.text.slice(0, 1)}</Label>
                            <Controls color={color}>
                                <EditFilled
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsEditLabelModalVisible(true);
                                    }}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                    }}
                                />
                            </Controls>
                        </SelectionInformation>
                    </>
                ) : null}
            </SelectionBoundary>
            {
                // NOTE: It's important that the parent element of the tokens
                // is the PDF canvas, because we need their absolute position
                // to be relative to that and not another absolute/relatively
                // positioned element. This is why SelectionTokens are not inside
                // SelectionBoundary.
                annotation.tokens ? (
                    <SelectionTokens pageInfo={pageInfo} tokens={annotation.tokens} />
                ) : null
            }
            {isEditLabelModalVisible ? (
                <EditLabelModal
                    annotation={annotation}
                    onHide={() => setIsEditLabelModalVisible(false)}
                />
            ) : null}
        </>
    );
};

// We use transform here because we need to translate the label upward
// to sit on top of the bounds as a function of *its own* height,
// not the height of it's parent.

// interface SelectionInfoProps {
//     border: number;
//     color: string;
// }
// const SelectionInfo = styled.div<SelectionInfoProps>(
//     ({ border, color }) => `
//         position: absolute;
//         right: -${border}px;
//         transform:translateY(-100%);
//         border: ${border} solid  ${color};
//         background: ${color};
//         font-weight: bold;
//         font-size: 12px;
//         user-select: none;

//         * {
//             margin: 2px;
//             vertical-align: middle;
//         }
//     `
// );

const SelectionInformation = styled.div`
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
`;

const Label = styled.div(
    ({ color }) => `
    font-weight: bold;
    color: ${color};
`
);

const Controls = styled.div(
    ({ color }) => `
    font-weight: bold;
    color: ${color};
`
);
