"use client";
import React from "react";
import Main from "../components/Main";
import Navigations from "../components/Navigations/Navigations";

type Props = {};

export default function page({}: Props) {
  return (
    <>
      <Main />

      <Navigations />
    </>
  );
}
