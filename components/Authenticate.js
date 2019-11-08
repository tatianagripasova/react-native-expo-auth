import React, { useEffect, useRef } from 'react';
import { StyleSheet, Button, View, Modal } from 'react-native';
import t from "tcomb-form-native";
import * as LocalAuthentication from "expo-local-authentication";

const Form = t.form.Form;

const validateEmail = (email) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return true;
    }
    return false;
};

const Email = t.refinement(t.String, validateEmail);

const Login = t.struct({
    email: Email, 
    password: t.String
});

const SignUp = t.struct({
    email: Email, 
    password: t.String,
    repeatPassword: t.String
});

const Authenticate = props => {

    const loginValueContainer = useRef()

    const submitLogin = () => {
        const data = loginValueContainer.current.getValue();
        if(data) {
            props.onLogin(data)
        }
    }
    return (
        <Modal visible={true}>
           <View>
                <Form 
                    type={Login} 
                    ref={loginValueContainer}
                />
                <Button 
                    title="Sign In" 
                    onPress={submitLogin}
                />
           </View>
           <View>
                <Form type={SignUp}/>
                <Button title="Sign Up" />
           </View>
        </Modal>
    )
};

const styles = StyleSheet.create({

});

export default Authenticate;