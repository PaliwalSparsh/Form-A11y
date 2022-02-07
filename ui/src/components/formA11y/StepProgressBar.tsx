// @ts-nocheck

import styled from 'styled-components';

import { Steps } from '@allenai/varnish';
const { Step } = Steps;

const StepProgressBar = () => {
    return (
        <Container>
            <Steps progressDot current={5}>
                <Step title="Section" />
                <Step title="Fields" />
                <Step title="Labels" />
                <Step title="Groups" />
                <Step title="Tooltips" />
            </Steps>
        </Container>
    );
};

const Container = styled.div`
    width: 30%;
`;

export default StepProgressBar;
