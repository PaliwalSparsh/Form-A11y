// @ts-nocheck
import styled from 'styled-components';
import Steps from './Steps';
import Zoom from './Zoom';

const ZoomContainer = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
    flex-direction: column;
`;

export const Header = ({ currentLayer }) => {
    return (
        <Container>
            <LogoContainer>
                <img src="/logo.svg" />
            </LogoContainer>
            <StepsContainer>
                <Steps current={currentLayer} stepInfo={stepInfo} />
            </StepsContainer>
            <ZoomContainer>
                <Zoom />
            </ZoomContainer>
        </Container>
    );
};

const stepInfo = [
    {
        title: 'Section',
        description:
            'Mark the area you want to fix first. We will go through the form in small chunks. Ensure that fields or groups (radioboxes) are completely included and not cut off in half .',
    },
    {
        title: 'Fields',
        description:
            'Ensure all form fields have a box and a field type present on them. If not, draw a box using the mouse and assign the field type.',
    },
    {
        title: 'Labels',
        description:
            'Ensure all form fields have a label associated to them. If not, select the field and use update label from the popup.',
    },
    {
        title: 'Groups',
        description:
            'Ensure the checkbox and radiobox are grouped properly and have group names. If not, you can select multiple boxes by dragging or Shift+Click and use popup menu to group fields. ',
    },
    {
        title: 'Tooltips',
        description:
            'Ensure these field descriptions (tooltips) are sufficient. If needed, add more information about the field using the edit button.',
    },
];

const LogoContainer = styled.div`
    width: 10%;
`;

const StepsContainer = styled.div`
    padding-left: 30%;
    width: 90%;
`;

const Container = styled.header`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    width: 100%;
`;
