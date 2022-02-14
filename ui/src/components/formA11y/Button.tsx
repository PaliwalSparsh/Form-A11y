// @ts-nocheck
import styled from 'styled-components';
import { Button as AntUIButton } from '@allenai/varnish';
import config from '../../config';

export const Button = styled(AntUIButton)`
    background-color: ${config.color.blue.medium};
    border-color: ${config.color.blue.medium};
    font-weight: bold;
`;
