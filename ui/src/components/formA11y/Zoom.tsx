// @ts-nocheck
// import styled from 'styled-components';
import { Slider } from '@allenai/varnish';

const marks = {
    1: '1',
    33: '33',
    66: '66',
    100: '100',
};

export const Zoom = ({ onChange }) => {
    return (
        <>
            <h5>Zoom</h5>
            <Slider marks={marks} step={null} defaultValue={1} onChange={onChange} />
        </>
    );
};
