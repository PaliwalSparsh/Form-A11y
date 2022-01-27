// @ts-nocheck

import { useEffect } from 'react';
import { Typography, Progress, Button } from '@allenai/varnish';
import styled from 'styled-components';
import { ArrowRightOutlined, ArrowLeftOutlined, PlayCircleOutlined } from '@ant-design/icons';
// import { PDF } from '../components';

const { Text } = Typography;

export const HomePage = () => {
    useEffect(() => console.log('HomePage'), []);
    return (
        <HomeContainer>
            <Header>
                <Logo level={5}>Form A11y</Logo>
                <StateIndicator>
                    Review <ArrowRightOutlined /> Remediate <ArrowRightOutlined /> Suggestion
                </StateIndicator>
                <Progress type="circle" percent={75} width={48} />
            </Header>
            <Content>
                <LeftSidebar />
                <FormContainer>{/* <PDF /> */}</FormContainer>
                <RightSidebar />
            </Content>
            <Footer>
                <ReviewButtonContainer>
                    <Button shape="circle" icon={<ArrowRightOutlined />} />
                    <Button type="primary" shape="circle" icon={<PlayCircleOutlined />} />
                    <Button shape="circle" icon={<ArrowLeftOutlined />} />
                </ReviewButtonContainer>
            </Footer>
        </HomeContainer>
    );
};

const HomeContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    height: 100%;
    padding: 48px;
    background-color: #fafafa;
`;

const StateIndicator = styled.div``;

const Logo = styled(Text)`
    color: #fead21;
    font-weight: bold;
`;

const Header = styled.header`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 8%;
`;

const Content = styled.div`
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

const FormContainer = styled.div`
    width: 80%;
`;

const RightSidebar = styled.div`
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

const ReviewButtonContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    width: 200px;
`;
