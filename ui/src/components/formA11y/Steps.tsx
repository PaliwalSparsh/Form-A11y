// @ts-nocheck

import styled from 'styled-components';
import config from '../../config';

const blueBackground = { backgroundColor: config.color.blue };
const lineGrayBackground = { backgroundColor: config.color.gray.line };
const lightGrayBackground = { backgroundColor: config.color.gray.light };

const Step = ({ title, completed = false, active = false, first = false, last = false }) => {
    const firstStyle = first ? lineGrayBackground : {};
    const lastStyle = last ? lineGrayBackground : {};

    const completedStyle = completed ? blueBackground : lightGrayBackground;

    const activeStyleSecondTail = active ? lightGrayBackground : {};
    const activeStyleFirstTail = active ? blueBackground : {};
    const activeStyleDot = active ? blueBackground : {};

    return (
        <StepContainer>
            <TailAndDotContainer>
                <Tail style={{ ...completedStyle, ...activeStyleFirstTail, ...firstStyle }} />
                <DotContainer>
                    <Dot style={{ ...completedStyle, ...activeStyleDot }} />
                </DotContainer>
                <Tail style={{ ...completedStyle, ...activeStyleSecondTail, ...lastStyle }} />
            </TailAndDotContainer>
            <Title>{title}</Title>
        </StepContainer>
    );
};

const Steps = ({ stepInfo, current }) => {
    return (
        <StepsAndDescriptionContainer>
            <StepsContainer>
                {stepInfo.map((step, index) => {
                    const isFirst = index === 0;
                    const isLast = index === stepInfo.length - 1;
                    const isActive = current === index;
                    const isCompleted = current > index;
                    return (
                        <Step
                            key={index}
                            title={step.title}
                            completed={isCompleted}
                            active={isActive}
                            first={isFirst}
                            last={isLast}
                        />
                    );
                })}
            </StepsContainer>
            <DescriptionContainer>{stepInfo[current].description}</DescriptionContainer>
        </StepsAndDescriptionContainer>
    );
};

const StepsAndDescriptionContainer = styled.div`
    width: 30%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
`;

const StepsContainer = styled.div`
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    height: 64px;
`;

const DescriptionContainer = styled.div`
    margin-top: 16px;
    width: 100%;
    text-align: center;
    font-weight: bold;
    color: ${config.color.gray.dark};
`;

const StepContainer = styled.div`
    width: 20%;
    display: flex;
    flex-wrap: wrap;
`;

const TailAndDotContainer = styled.div`
    width: 100%;
    height: 16px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
`;

const Tail = styled.div`
    width: 45%;
    height: 2px;
    background-color: ${config.color.blue};
`;

const DotContainer = styled.div`
    width: 10%;
`;

const Dot = styled.div`
    width: 8px;
    border-radius: 50%;
    height: 8px;
    background-color: ${config.color.blue};
    margin: auto;
`;

const Title = styled.div`
    width: 100%;
    text-align: center;
    font-weight: bold;
`;

export default Steps;
