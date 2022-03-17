import React from 'react';
import styled from 'styled-components';
import { Button, Select } from '@allenai/varnish';
import { PDFStore } from '../../context';

const ButtonContainer = styled.div`
    display: flex;
`;

const ZoomContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 16px;
    padding-bottom: 16px;
`;

const options = [
    { label: '10%', value: 10 },
    { label: '20%', value: 20 },
    { label: '30%', value: 30 },
    { label: '40%', value: 40 },
    { label: '50%', value: 50 },
    { label: '60%', value: 60 },
    { label: '70%', value: 70 },
    { label: '80%', value: 80 },
    { label: '90%', value: 90 },
    { label: '100%', value: 100 },
    { label: '110%', value: 110 },
    { label: '120%', value: 120 },
    { label: '130%', value: 130 },
];

const Zoom: React.FC = () => {
    const { zoom, setZoom } = React.useContext(PDFStore);
    return (
        <ZoomContainer>
            <h5 style={{ margin: 0, marginBottom: '8px' }}>Zoom</h5>
            <ButtonContainer>
                <Button
                    onClick={() =>
                        setZoom((prevZoom: number) => (prevZoom <= 10 ? 10 : prevZoom - 10))
                    }>
                    -
                </Button>
                <Select
                    value={zoom}
                    dropdownStyle={{ width: '100px' }}
                    dropdownMatchSelectWidth={100}
                    onChange={(num) => setZoom(num)}
                    options={options}
                />
                <Button
                    onClick={() => {
                        setZoom((prevZoom: number) => (prevZoom >= 130 ? 130 : prevZoom + 10));
                    }}>
                    +
                </Button>
            </ButtonContainer>
        </ZoomContainer>
    );
};

export default Zoom;
