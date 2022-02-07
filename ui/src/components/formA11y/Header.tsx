// @ts-nocheck
import styled from 'styled-components';
import StepProgressBar from './StepProgressBar';

export const Header = () => {
    return (
        <Container>
            <LogoContainer>
                <img src="/logo.svg" />
            </LogoContainer>
            <StepsContainer>
                <StepProgressBar />
            </StepsContainer>
        </Container>
    );
};

const LogoContainer = styled.div`
    width: 10%;
`;

const StepsContainer = styled.div`
    width: 90%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
`;

const Container = styled.header`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    width: 100%;
`;
