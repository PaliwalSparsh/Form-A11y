// @ts-nocheck
import { createContext } from 'react';

export const toolType = {
    ARROW: 'ARROW',
    SHAPE: 'SHAPE',
    MOVE: 'MOVE',
};

export const ToolStore = createContext({
    currentTool: toolType.ARROW,
    setCurrentTool: (_: Error) => {
        throw new Error('Unimplemented');
    },
});
