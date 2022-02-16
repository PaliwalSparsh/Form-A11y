// @ts-nocheck
import styled from 'styled-components';
import { DownOutlined } from '@ant-design/icons';
import config from '../../config';

// const MENU_WIDTH = 150;
// const MENU_HEIGHT = 40;

// const ActionMenu = ({ position, children }) => {
// const x = position.x - MENU_WIDTH / 2;
// const y = position.y - MENU_HEIGHT - 10;
export const ActionMenu = ({ children }) => {
    return (
        // <MenuContainer style={{ top: y, left: x }}> Add this later!!
        <MenuContainer>
            <Menu>{children}</Menu>
        </MenuContainer>
    );
};

ActionMenu.FieldLayer = () => {
    return (
        <ActionMenu>
            <MenuItem>
                TextField
                <DownOutlined />
            </MenuItem>
            <MenuItem>Duplicate</MenuItem>
            <MenuItem>Delete</MenuItem>
        </ActionMenu>
    );
};

const MenuContainer = styled.div`
    position: absolute;
    width: auto;
    height: 2.5rem;
    z-index: 11;
`;

const Menu = styled.div`
    width: auto;
    height: 100%;
    background: white;
    box-shadow: ${config.color.gray.light} 0px 7px 29px 0px;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
`;

const MenuItem = styled.span`
    width: auto;
    min-width: 4rem;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
    font-family: 'Roboto', sans-serif;
    font-weight: 700;
    border-right: 1px solid ${config.color.gray.line};
    img {
        width: 100%;
        height: 100%;
        max-width: 1rem;
        max-height: 1.125rem;
    }
    &:last-of-type {
        border-right: none;
    }

    &:hover {
        background: ${config.color.gray.line};
        cursor: pointer;
    }

    &:first-of-type:hover {
        border-top-left-radius: 0.5rem;
        border-bottom-left-radius: 0.5rem;
    }

    &:last-of-type:hover {
        border-top-right-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
    }
`;
