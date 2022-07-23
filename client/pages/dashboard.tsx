import { useState } from 'react';
import type { NextPage } from 'next';
import Preview from '../components/preview';
import Loader from '../components/loader';
import expenseService, { ExpenseModel } from '../services/expenses';
import AsyncState from '../models/async-state';
import { toast } from 'react-toastify';
import { useEffectOnce } from '../hooks/use-effect-once';
import { useAccount, useContract, useProvider } from 'wagmi';
import splitContractArtifact from '../utils/abis/Split.json';
import Link from 'next/link';

const Dashboard: NextPage = () => {
  if (!process.env.NEXT_PUBLIC_SPLIT_CONTRACT_ADDRESS)
    throw new Error(
      'Environment variable NEXT_PUBLIC_SPLIT_CONTRACT_ADDRESS is undefined'
    );
  const { address } = useAccount();
  const [state, setState] = useState<AsyncState<ExpenseModel[]>>({
    data: undefined,
    loading: true,
    error: undefined,
  });
  const provider = useProvider();
  const contract = useContract({
    addressOrName: process.env.NEXT_PUBLIC_SPLIT_CONTRACT_ADDRESS,
    contractInterface: splitContractArtifact.abi,
    signerOrProvider: provider,
  });

  useEffectOnce(() => {
    if (!address) throw new Error('No active wallet connection');
    setState({ data: undefined, loading: true, error: undefined });
    const fetchData = async () => {
      try {
        const res = await expenseService.loadExpenses(contract, address);
        if (loading == true) {
          setState({ data: res, loading: false, error: false });
          toast.success('Loaded expenses');
        }
      } catch (error) {
        setState({ data: undefined, loading: false, error });
        toast.error('Error while loading expenses');
      }
    };
    fetchData();
  });

  const { data, loading, error } = state;
  return (
    <div className="h-full bg-body-gradient pb-20">
      <div className="container mx-auto">
        <p className="pt-16 pb-8 text-primary text-3xl font-sans font-bold">
          Your Expenses
        </p>
        {loading ? (
          <div style={{ minHeight: '70vh' }}>
            <Loader />
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {data?.map((expense, index) => (
              <Link key={index} href={`/expenses/${index}`}>
                <a>
                  <Preview expense={expense}></Preview>
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
