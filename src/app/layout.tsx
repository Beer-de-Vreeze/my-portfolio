import "../app/globals.css"; 
import LoadingBar from "@/components/loadingbar";

export const metadata = {
  title: "Beer de Vreeze - Portfolio",
  description: "Game Developer Portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <LoadingBar />
        {children}
      </body>
    </html>
  );
}

