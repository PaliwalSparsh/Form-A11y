// @ts-nocheck

import { Header } from '../components/formA11y';
import { Button } from '@allenai/varnish';
import styled from 'styled-components';

export const HomePage = () => {
    return (
        <HomeContainer>
            <Header />
            <Content>
                <LeftSidebar />
                <FormContainer>{/* <PDF /> */}</FormContainer>
                <RightSidebar />
            </Content>
            <Footer>
                <Button type="primary" shape="round">
                    Proceed to Next Layer
                </Button>
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
    background-color: #ececec;
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
