import React from "react";
import { View, ScrollView } from "react-native";
import ItemOrder from "./components/ItemOrder";

function ListOrder() {
    return (
        <ScrollView className="flex-1 py-[12px] px-[16px] space-y-[20px]" >
            <ItemOrder />
            <ItemOrder />
            <ItemOrder />
            <ItemOrder />
        </ScrollView>
    );
}

export default ListOrder;
