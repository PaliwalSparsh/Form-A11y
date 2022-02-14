// @ts-nocheck
import styled from 'styled-components';
import { Button } from '@allenai/varnish';
import config from '../../config';

export const IconButton = ({ type, props }) => {
    return (
        <AntUIButton type="primary" {...props}>
            {type === 'field' && <img src="/fieldIcon.svg" />}
            {type === 'cursor' && <img src="/cursorIcon.svg" />}
        </AntUIButton>
    );
};

const AntUIButton = styled(Button)`
    background-color: ${config.color.white};
    border-color: ${config.color.white};
    width: 48px;
    height: 48px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    margin: 16px;
    &:hover {
        img {
            filter: invert(1);
        }
        background-color: ${config.color.blue.dark};
    }
`;
