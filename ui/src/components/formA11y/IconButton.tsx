// @ts-nocheck
import styled from 'styled-components';
import { Button } from '@allenai/varnish';
import config from '../../config';
import { toolType } from '../../context';

export const IconButton = ({ type, ...props }) => {
    return (
        <AntUIButton type="primary" {...props}>
            {type === toolType.SHAPE && <img src="/fieldIcon.svg" />}
            {type === toolType.ARROW && <img src="/cursorIcon.svg" />}
        </AntUIButton>
    );
};

const AntUIButton = styled(Button)`
    background-color: ${(props) =>
        props.isSelected ? config.color.blue.dark : config.color.white};
    border-color: ${config.color.white};
    width: 48px;
    height: 48px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    margin: 16px;
    opacity: ${(props) => (props.isSelected ? '1' : '0.8')};
    & {
        img {
            filter: ${(props) => (props.isSelected ? 'invert(1)' : 'invert(0)')};
        }
    }
    &:hover {
        opacity: 1;
        background-color: ${config.color.white};
        border-color: ${config.color.white};
    }
`;
