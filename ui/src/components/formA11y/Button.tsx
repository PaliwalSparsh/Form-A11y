// @ts-nocheck
import styled from 'styled-components';
import { Button as AntUIButton } from '@allenai/varnish';
import config from '../../config';

export const Button = styled(AntUIButton)`
    background-color: ${config.color.blue};
    border-color: ${config.color.blue};
    font-weight: bold;
`;
