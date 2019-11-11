import React from "react";
import { View } from "react-native";

const ConditionalView = (props) => {
    const { children, visible, style } = props;
    if (!visible) {
        return null;
    } 
    return (
        <View {...this.props} style={style}>
          { children }
        </View>
    ); 
};

export default ConditionalView;
