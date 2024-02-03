import axios from "axios";
import {
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAIL,

  USER_FIREBASE_REGISTER_REQUEST,
  USER_FIREBASE_REGISTER_SUCCESS,
  USER_FIREBASE_REGISTER_FAIL,
} from "../constants/user";
import { auth } from "../../firebase/firebase";
import firebase from "firebase/compat/app";

export const loginUser = () => async (dispatch) => {
  try {
    // dispatch({ type: USER_LOGOUT_RESET });

    dispatch({
      type: USER_LOGIN_REQUEST,
    });

    //1 - init Google Auth Provider
    const provider = new firebase.auth.GoogleAuthProvider();

    //2 - create the popup signIn
    await auth.signInWithPopup(provider).then(
      async (result) => {
        //3 - pick the result and store the token
        const token = await auth?.currentUser?.getIdToken(true);
        //4 - check if have token in the current user
        if (token) {
          //5 - put the token at localStorage (We'll use this to make requests)
          localStorage.setItem("@token", token);
          //6 - dispatch reducer to show success
          dispatch({
            type: USER_LOGIN_SUCCESS,
            payload: token,
          });
        }
      },
      function (error) {
        console.log(error);
      }
    );
  } catch (error) {
    dispatch({
      type: USER_LOGIN_FAIL,
      payload: error.response.data,
    });
  }
};

export const registerUserWithEmailAndPassword = (email, password) => async (dispatch) => {
  try {

    dispatch({
      type: USER_FIREBASE_REGISTER_REQUEST,
    });

    const credentials = await auth.createUserWithEmailAndPassword(email, password)
    console.log(credentials)

    if (credentials.user) {
      dispatch({
        type: USER_FIREBASE_REGISTER_SUCCESS,
        payload: { uid: credentials.user.uid, email: credentials.user.email },
      });
      console.log(credentials.user.multiFactor.user.accessToken)
      localStorage.setItem("@user", credentials.user.multiFactor.user.accessToken);
    }
  } catch (error) {
    dispatch({
      type: USER_FIREBASE_REGISTER_FAIL,
      payload: error.response.data
    });
  }
}

export const registerUser = ({firstName, lastName, age, gender, phoneNumber, emergencyContact}) => async (dispatch) => {
  try {
    // in future might want to reset this
    // dispatch({ type: USER_LOGOUT_RESET });

    dispatch({
      type: USER_REGISTER_REQUEST,
    });

    const config = {
      headers: {
        "Content-type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("@user")
      },
    };

    const { data } = await axios.post(
      "/api/register",
      {firstName, lastName, age, gender, phoneNumber, emergencyContact},
      config
    );

    dispatch({
      type: USER_REGISTER_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: USER_REGISTER_FAIL,
      payload: error.response.data,
    });
  }
};


// cg version
// export const registerUserWithEmailAndPassword = (email, password) => async (dispatch) => {
//   try {

//     dispatch({
//       type: USER_REGISTER_REQUEST,
//     });

//     const credentials = await auth.createUserWithEmailAndPassword(email, password)
//       .then( async userCredential => {
//         console.log(userCredential)
//         const authByFirebase = await userCredential.user.multiFactor.user;

//         if (authByFirebase.uid && authByFirebase.email) {
//           dispatch({
//             type: USER_REGISTER_SUCCESS,
//             payload: { uid: authByFirebase.uid, email: authByFirebase.email },
//           });
//         }
//       })
//     // const authByFirebase = credentials.user.multiFactor.user.auth
//     // // console.log(authByFirebase)
//     // if (credentials.user) {
//     //   dispatch({
//     //     type: USER_REGISTER_SUCCESS,
//     //     payload: { uid: authByFirebase.uid, email: authByFirebase.email },
//     //   });
//     // }

//     // console.log(authByFirebase)
//     // localStorage.setItem("@user", authByFirebase.accessToken);
//   } catch (error) {
//     dispatch({
//       type: USER_REGISTER_FAIL,
//       payload: error.response.data
//     });
//   }
// }



export const test = () => async (dispatch) => {
  try {
    const config = {
      headers: {
        "Content-type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("@token")
      },
    };
    const { data } = await axios.get("/test", config);
    console.log(data);
  } catch (error) {
    console.log(error);
  }
};
