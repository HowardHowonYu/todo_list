import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Dimensions,
  Platform,
  ScrollView,
  AsyncStorage,
} from "react-native";
import Todo from "./Todo";
import { AppLoading } from "expo";
import uuidv1 from "uuid/v1";

const { height, width } = Dimensions.get("window");

export default class App extends React.Component {
  state = {
    newTodo: "",
    loadedToDos: false,
    toDos: {},
  };
  componentDidMount = () => {
    this._loadToDos();
  };

  render() {
    const { newTodo, loadedToDos, toDos } = this.state;
    if (!loadedToDos) {
      return <AppLoading />;
    }
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <Text style={styles.title}>To Do List</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder={"New to do"}
            value={newTodo}
            onChangeText={this._controlNewTodo}
            placeholderTextColor={"#999"}
            returnKeyType={"done"}
            autoCorrect={false}
            onSubmitEditing={this._addTodo}
          ></TextInput>
          <ScrollView contentContainerStyle={styles.toDos}>
            {Object.values(toDos)
              .reverse()
              .map(toDo => (
                <Todo
                  key={toDo.id}
                  delteTodo={this._deleteTodo}
                  completeTodo={this._completeTodo}
                  uncompleteTodo={this._uncompleteTodo}
                  updateToDo={this._updateToDo}
                  {...toDo}
                />
              ))}
          </ScrollView>
        </View>
      </View>
    );
  }
  _controlNewTodo = text => {
    this.setState({ newTodo: text });
  };
  _loadToDos = async () => {
    try {
      const toDos = await AsyncStorage.getItem("toDos");
      const parsedTodos = JSON.parse(toDos);
      this.setState({ loadedToDos: true, toDos: parsedTodos || {} });
    } catch (err) {
      console.log(err);
    }
    this.setState({
      loadedToDos: true,
    });
  };
  _addTodo = () => {
    const { newTodo } = this.state;
    if (newTodo !== "") {
      this.setState(prevState => {
        const ID = uuidv1();
        const newToDoObject = {
          [ID]: {
            id: ID,
            isCompleted: false,
            text: newTodo,
            createdAt: Date.now(),
          },
        };
        const newState = {
          ...prevState,
          newTodo: "",
          toDos: {
            ...prevState.toDos,
            ...newToDoObject,
          },
        };
        this._saveTodos(newState.toDos);
        return { ...newState };
      });
    }
  };
  _deleteTodo = id => {
    this.setState(prevState => {
      const toDos = prevState.toDos;
      delete toDos[id];
      const newState = {
        ...prevState,
        ...toDos,
      };
      this._saveTodos(newState.toDos);
      return { ...newState };
    });
  };
  _uncompleteTodo = id => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            isCompleted: false,
          },
        },
      };
      this._saveTodos(newState.toDos);
      return { ...newState };
    });
  };
  _completeTodo = id => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            isCompleted: true,
          },
        },
      };
      this._saveTodos(newState.toDos);

      return { ...newState };
    });
  };
  _updateToDo = (id, text) => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            // updateToDo에서는 그전의 toDos의 ID로 찾아서 다 가져오고 text 만 새로 받은 것으로 바꿈
            text: text,
          },
        },
      };
      this._saveTodos(newState.toDos);
      return { ...newState };
    });
  };
  _saveTodos = newTodos => {
    //AsyncStorage는 object를 저장하지 못하고, string만 저장할수 있음
    const saveTodos = AsyncStorage.setItem("toDos", JSON.stringify(newTodos));
    // console.log(JSON.stringify(newTodos));
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F23657",
    alignItems: "center",
  },
  title: {
    color: "black",
    fontSize: 30,
    marginTop: 50,
    fontWeight: "300",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "#fff",
    flex: 1,
    width: width - 25,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: "rgb(50,50,50)",
        shadowOpacity: 0.5,
        shadowRadius: 5,
        shadowOffset: {
          height: -1,
          width: 0,
        },
      },
      android: {
        elevation: 3,
      },
    }),
  },
  input: {
    padding: 20,
    borderBottomColor: "#52575d",
    borderBottomWidth: 1,
    fontSize: 25,
  },
  toDos: {
    alignItems: "center",
  },
});
