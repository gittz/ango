import {Component} from "../src/index";

class App extends Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return <span>{this.text}</span>;
    }
}

export default App;
