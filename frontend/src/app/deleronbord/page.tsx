"use client";

import DeleronbordForm from "@/components/Header/DeleronbordForm";
import Navbar from "@/components/Navbar/Navbar";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  return (
    <main style={{ padding: 16 }}>
      <Navbar backToPrevious={() => router.back()} title="Deleronbord" />
      <DeleronbordForm />
    </main>
  );
}


