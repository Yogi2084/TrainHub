"use client";

import React from "react";
import Logincard from "./components/LoginCard";
import { PageTransition } from "@/components/ui/page-transition";

const LoginPage = () => {
  return (
    <PageTransition>
      <Logincard />
    </PageTransition>
  );
};

export default LoginPage;
