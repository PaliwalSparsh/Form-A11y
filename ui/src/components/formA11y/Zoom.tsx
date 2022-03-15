// @ts-nocheck
import styled from 'styled-components';
import { Button, Select } from '@allenai/varnish';

interface ZoomProps {
    onChange: () => void;
}

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
];

const Zoom: React.FC<ZoomProps> = (props) => {
    const { onChange } = props;
    console.log(onChange);
    return (
        <ZoomContainer>
            <h5 style={{ margin: 0, marginBottom: '8px' }}>Zoom</h5>
            <ButtonContainer>
                <Button>-</Button>
                <Select
                    value={10}
                    dropdownStyle={{ width: '100px' }}
                    dropdownMatchSelectWidth={100}
                    options={options}
                />
                <Button>+</Button>
            </ButtonContainer>
        </ZoomContainer>
    );
};

export default Zoom;
