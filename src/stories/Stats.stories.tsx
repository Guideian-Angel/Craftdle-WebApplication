import { Provider } from "react-redux";
import "../style.css"
import { store } from "../app/store";
import { BrowserRouter } from "react-router-dom";
import { handlers } from './handlers';
import { Stats } from "../pages/Stats/Stats";

export default {
    title: "Pages/Stats",
    component: Stats,
    decorators: [
        (Story: any) => (
            <Provider store={store}>
                <Story />
            </Provider>
        ),
    ],
    parameters: {
        msw: {
            handlers: handlers,
        },
    },
};

export const Default = () => {
    return <BrowserRouter>
        <Stats />
    </BrowserRouter>
}