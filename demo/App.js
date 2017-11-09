import {Component} from "../src/index";
import Child from "./Child";

class App extends Component {
    constructor(props, context) {
        super(props, context);
    }

    state() {
        return {
            text: 1
        }
    }

    render() {
        return <div onClick={() => {
            this.text++
        }}>
            <Child text={this.text}/>
        </div>;
    }
}

export default App;
