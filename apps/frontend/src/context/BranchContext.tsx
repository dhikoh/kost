'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface BranchContextType {
    currentBranch: any;
    setCurrentBranch: (branch: any) => void;
    branches: any[];
    setBranches: (branches: any[]) => void;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: React.ReactNode }) {
    const [currentBranch, setCurrentBranch] = useState<any>(null);
    const [branches, setBranches] = useState<any[]>([]);

    useEffect(() => {
        // Load from local storage or API
        const saved = localStorage.getItem('kost_branch');
        if (saved) setCurrentBranch(JSON.parse(saved));
    }, []);

    return (
        <BranchContext.Provider value={{ currentBranch, setCurrentBranch, branches, setBranches }}>
            {children}
        </BranchContext.Provider>
    );
}

export function useBranch() {
    const context = useContext(BranchContext);
    if (context === undefined) {
        throw new Error('useBranch must be used within a BranchProvider');
    }
    return context;
}
