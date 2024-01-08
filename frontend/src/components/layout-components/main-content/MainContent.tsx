import { ReactNode } from 'react';
import './MainContent.scss'

interface MainContentProps {
  className?: string;
  children: ReactNode;
}

const MainContent = ({ className, children }: MainContentProps) => {
  return (
    <main
      className={`main-content ${className ? className : ''}`}
    >
      {children}
    </main>
  )
}
export default MainContent;