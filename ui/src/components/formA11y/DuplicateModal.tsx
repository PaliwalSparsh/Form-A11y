// @ts-nocheck
import styled from 'styled-components';
import React, { useState } from 'react';
import { Modal, Button, InputNumber, Checkbox } from '@allenai/varnish';
// import config from '../../config';

export const DuplicateModal = () => {
    const [visible, setVisible] = useState(false);
    const showModal = () => {
        setVisible(true);
    };
    const hideModal = () => {
        setVisible(false);
    };
    const handleChangePreview = () => {};
    return (
        <>
            <Button type="primary" onClick={showModal}>
                Duplicate Fields
            </Button>
            <AntUIModal
                visible={visible}
                width={400}
                title="Duplicate Fields"
                onOk={() => {}}
                okText="Apply"
                okType="link"
                cancelType="link"
                onCancel={hideModal}
                closable={false}>
                <Content>
                    <Field>
                        <Label>Count</Label>
                        <InputNumber />
                    </Field>
                    <Field>
                        <Label>Gap</Label>
                        <InputNumber />
                    </Field>
                    <PreviewContainer>
                        <Checkbox onChange={handleChangePreview}>Preview</Checkbox>
                    </PreviewContainer>
                </Content>
            </AntUIModal>
        </>
    );
};

const AntUIModal = styled(Modal)`
    .ant-modal {
        width: 300px !important;
    }
`;

const Content = styled.div`
    display: flex;
    flex-wrap: wrap;
    width: 100%;
`;

const Field = styled.div`
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    align-items: center;
    margin-top: 8px;
`;

const Label = styled.div`
    margin-right: 16px;
    width: 16%;
    font-weight: bold;
`;

const PreviewContainer = styled.div`
    margin-top: 32px;
`;
