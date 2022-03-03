// @ts-nocheck
import React, { useContext, useCallback, useState, useEffect } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { useParams } from 'react-router-dom';
import * as pdfjs from 'pdfjs-dist';
import { Result, Progress, notification } from '@allenai/varnish';

import { QuestionCircleOutlined } from '@ant-design/icons';

import { PDF, CenterOnPage, RelationModal } from '../components';

import {
    pdfURL,
    getTokens,
    // PageTokens,
    // PaperStatus,
    getAllocatedPaperStatus,
    getLabels,
    // Label,
    getAnnotations,
    getRelations,
} from '../api';
import {
    PDFPageInfo,
    // Annotation,
    AnnotationStore,
    PDFStore,
    RelationGroup,
    PdfAnnotations,
} from '../context';

import * as listeners from '../listeners';
import { Header, Button, IconButton, DuplicateModal, ActionMenu } from '../components/formA11y';

enum ViewState {
    LOADING,
    LOADED,
    NOT_FOUND,
    ERROR,
}

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export const HomePage = () => {
    const { sha } = useParams();
    const [viewState, setViewState] = useState(ViewState.LOADING);

    const [doc, setDocument] = useState();
    const [progress, setProgress] = useState(0);
    const [pages, setPages] = useState();
    const [pdfAnnotations, setPdfAnnotations] = useState(new PdfAnnotations([], []));

    const [selectedAnnotations, setSelectedAnnotations] = useState([]);

    const [, setAssignedPaperStatuses] = useState([]);
    const [, setActivePaperStatus] = useState();
    const [activeLabel, setActiveLabel] = useState();
    const [labels, setLabels] = useState([]);
    const [relationLabels, setRelationLabels] = useState([]);
    const [activeRelationLabel, setActiveRelationLabel] = useState();
    // this is turned off by default in pawls.
    const [freeFormAnnotations, toggleFreeFormAnnotations] = useState(false);
    const [hideLabels, setHideLabels] = useState(false);

    const [relationModalVisible, setRelationModalVisible] = useState(false);

    const onError = useCallback(
        (err) => {
            console.error('Unexpected Error rendering PDF', err);
            setViewState(ViewState.ERROR);
        },
        [setViewState]
    );

    const theme = useContext(ThemeContext);

    const onRelationModalOk = (group: RelationGroup) => {
        setPdfAnnotations(pdfAnnotations.withNewRelation(group));
        setRelationModalVisible(false);
        setSelectedAnnotations([]);
    };

    const onRelationModalCancel = () => {
        setRelationModalVisible(false);
        setSelectedAnnotations([]);
    };

    // get labels for the current document
    useEffect(() => {
        getLabels().then((labels) => {
            setLabels(labels);
            setActiveLabel(labels[0]);
        });
    }, []);

    // get relations for the current document
    useEffect(() => {
        getRelations().then((relations) => {
            setRelationLabels(relations);
            setActiveRelationLabel(relations[0]);
        });
    }, [sha]);

    // get status for the current document, can user edit it or is it just read-only.
    useEffect(() => {
        getAllocatedPaperStatus()
            .then((allocation) => {
                setAssignedPaperStatuses(allocation.papers);
                setActivePaperStatus(allocation.papers.filter((p) => p.sha === sha)[0]);
                if (!allocation.hasAllocatedPapers) {
                    notification.warn({
                        message: 'Read Only Mode!',
                        description:
                            "This annotation project has no assigned papers for your email address. You can make annotations but they won't be saved.",
                    });
                }
            })
            .catch((err) => {
                setViewState(ViewState.ERROR);
                console.log(err);
            });
    }, [sha]);

    // get pdf file and its token
    useEffect(() => {
        setDocument(undefined);
        setViewState(ViewState.LOADING);
        const loadingTask = pdfjs.getDocument(pdfURL(sha));
        loadingTask.onProgress = (p) => {
            setProgress(Math.round((p.loaded / p.total) * 100));
        };
        Promise.all([
            // PDF.js uses their own `Promise` type, which according to TypeScript doesn't overlap
            // with the base `Promise` interface. To resolve this we (unsafely) cast the PDF.js
            // specific `Promise` back to a generic one. This works, but might have unexpected
            // side-effects, so we should remain wary of this code.
            loadingTask.promise,
            getTokens(sha),
        ])
            .then(([doc, resp]) => {
                // this is full document contains all pages.
                setDocument(doc);

                // Load all the pages too. In theory this makes things a little slower to startup,
                // as fetching and rendering them asynchronously would make it faster to render the
                // first, visible page. That said it makes the code simpler, so we're ok with it for
                // now.
                const loadPages = [];
                for (let i = 1; i <= doc.numPages; i++) {
                    // See line 50 for an explanation of the cast here.
                    loadPages.push(
                        // getPage is an async process, thus Promise.all is used.
                        doc.getPage(i).then((p) => {
                            const pageIndex = p.pageNumber - 1;
                            const pageTokens = resp[pageIndex].tokens;
                            return new PDFPageInfo(p, pageTokens);
                        })
                    );
                }
                // loadPages is an array of PDFPageInfo objects. This object contains page data and its tokens.
                return Promise.all(loadPages);
            })
            .then((pages) => {
                setPages(pages);
                // Get any existing annotations for this pdf.
                getAnnotations(sha)
                    .then((paperAnnotations) => {
                        setPdfAnnotations(paperAnnotations);

                        setViewState(ViewState.LOADED);
                    })
                    .catch((err) => {
                        console.error(`Error Fetching Existing Annotations: `, err);
                        setViewState(ViewState.ERROR);
                    });
            })
            .catch((err) => {
                if (err instanceof Error) {
                    // We have to use the message because minification in production obfuscates
                    // the error name.
                    if (err.message === 'Request failed with status code 404') {
                        setViewState(ViewState.NOT_FOUND);
                        return;
                    }
                }
                console.error(`Error Loading PDF: `, err);
                setViewState(ViewState.ERROR);
            });
    }, [sha]);

    switch (viewState) {
        case ViewState.LOADING:
            return (
                <HomeContainer>
                    <CenterOnPage>
                        <Progress
                            type="circle"
                            percent={progress}
                            strokeColor={{ '0%': theme.color.T6, '100%': theme.color.G6 }}
                        />
                    </CenterOnPage>
                </HomeContainer>
            );

        case ViewState.NOT_FOUND:
            return (
                <HomeContainer>
                    <CenterOnPage>
                        <Result icon={<QuestionCircleOutlined />} title="PDF Not Found" />
                    </CenterOnPage>
                </HomeContainer>
            );

        case ViewState.LOADED:
            if (doc && pages && pdfAnnotations) {
                return (
                    <PDFStore.Provider
                        value={{
                            doc,
                            pages,
                            onError,
                        }}>
                        <AnnotationStore.Provider
                            value={{
                                labels,
                                activeLabel,
                                setActiveLabel,
                                relationLabels,
                                activeRelationLabel,
                                setActiveRelationLabel,
                                pdfAnnotations,
                                setPdfAnnotations,
                                selectedAnnotations,
                                setSelectedAnnotations,
                                freeFormAnnotations,
                                toggleFreeFormAnnotations,
                                hideLabels,
                                setHideLabels,
                            }}>
                            <listeners.UndoAnnotation />
                            {/* Removed this so now Shift click for relation won't work.
                            <listeners.HandleAnnotationSelection
                                setModalVisible={setRelationModalVisible}
                            /> */}
                            <listeners.HandleAnnotationSelection />
                            <listeners.SaveWithTimeout sha={sha} />
                            <listeners.SaveBeforeUnload sha={sha} />
                            <listeners.HideAnnotationLabels />
                            {/* This is the place where we can add shortcuts for anything as listeners. */}
                            <HomeContainer>
                                {activeRelationLabel ? (
                                    <RelationModal
                                        visible={relationModalVisible}
                                        onClick={onRelationModalOk}
                                        onCancel={onRelationModalCancel}
                                        source={selectedAnnotations}
                                        label={activeRelationLabel}
                                    />
                                ) : null}
                                <PDF />
                            </HomeContainer>
                        </AnnotationStore.Provider>
                    </PDFStore.Provider>
                );
            } else {
                return null;
            }
        // eslint-disable-line: no-fallthrough
        case ViewState.ERROR:
            return (
                <HomeContainer>
                    <CenterOnPage>
                        <Result status="warning" title="Unable to Render Document" />
                    </CenterOnPage>
                </HomeContainer>
            );
    }
};

const HomeContainer = (props) => {
    const [currentLayer, setCurrentLayer] = useState(0);
    return (
        <Container>
            <Header currentLayer={currentLayer} />
            <ContentContainer>
                <LeftSidebar />
                <FormContainer>{props.children}</FormContainer>
                <RightSidebar>
                    <IconButton type="cursor" />
                    <IconButton type="field" />
                    <DuplicateModal />
                    <ActionMenu.FieldLayer />
                </RightSidebar>
            </ContentContainer>
            <Footer>
                <Button
                    type="primary"
                    shape="round"
                    onClick={() => setCurrentLayer(currentLayer + 1)}>
                    Proceed to Next Layer
                </Button>
            </Footer>
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    height: 100%;
    padding: 48px;
    background-color: #ececec;
`;

const ContentContainer = styled.div`
    display: flex;
    width: 100%;
    height: 84%;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
`;

const LeftSidebar = styled.div`
    width: 13%;
`;

// This is just a basic implementation needs a lot of fixes.
const FormContainer = styled.div`
    width: 1200px;
    overflow: hidden;
    height: 650px;
`;

const RightSidebar = styled.div`
    align-self: flex-start;
    width: 13%;
`;

const Footer = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 8%;
`;
