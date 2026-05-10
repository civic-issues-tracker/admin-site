import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../components/ui/Modal';
import SignupForm from '../components/SignupForm';

const SignupPage: React.FC = () => {
  const [isModalOpen] = useState(true);
  const navigate = useNavigate();

  const handleClose = () => {
    // setIsModalOpen(false);
    navigate('/'); 
  };

  return (
    <div className="min-h-screen w-full bg-primary flex items-center justify-center">
      <div className="opacity-[0.06] pointer-events-none select-none">
        <h1 className="text-[20vw] font-black uppercase tracking-tighter">የኛ Fix</h1>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleClose}
        title="Welcome to የኛ Fix !"
      >
        <SignupForm />
      </Modal>
    </div>
  );
};

export default SignupPage;