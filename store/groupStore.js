import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist } from "zustand/middleware";

export const useGroupStore = create(
  persist(
    (set, get) => ({
      groups: [],
      addGroup: (group) =>
        set((state) => ({
          groups: [{ ...group, expenses: [] }, ...state.groups],
        })),
      addExpense: (groupId, expense) =>
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId
              ? { ...group, expenses: [...group.expenses, expense] }
              : group
          ),
        })),
      deleteGroup: (groupId) =>
        set((state) => ({
          groups: state.groups.filter((group) => group.id !== groupId),
        })),

      calculateMemberBalances: (groupId) => {
        const group = get().groups.find((g) => g.id === groupId);
        if (!group || !group.members || !group.expenses) return [];

        const balances = group.members.map((member) => ({
          id: `${member.id}-${member.name}`,
          name: member.name,
          paid: 0,
          owes: 0,
          balance: 0,
          transactions: [],
        }));

        group.expenses.forEach((expense) => {
          const payerIndex = balances.findIndex((m) => m.name === expense.payer);
          if (payerIndex >= 0) {
            balances[payerIndex].paid += expense.amount;
          }

          if (expense.splitType === "equal") {
            const sharePerMember = expense.amount / group.members.length;
            balances.forEach((member, index) => {
              balances[index].owes += sharePerMember;
              if (member.name !== expense.payer) {
                balances[payerIndex].transactions.push({
                  from: member.name,
                  amount: sharePerMember,
                });
                balances[index].transactions.push({
                  to: expense.payer,
                  amount: sharePerMember,
                });
              }
            });
          } else if (expense.splitType === "custom" && expense.splits) {
            Object.entries(expense.splits).forEach(([memberId, amount]) => {
              const memberIndex = balances.findIndex(
                (m) => m.id.split("-")[0] === memberId
              );
              if (memberIndex >= 0) {
                balances[memberIndex].owes += amount;
                if (balances[memberIndex].name !== expense.payer) {
                  balances[payerIndex].transactions.push({
                    from: balances[memberIndex].name,
                    amount: amount,
                  });
                  balances[memberIndex].transactions.push({
                    to: expense.payer,
                    amount: amount,
                  });
                }
              }
            });
          }
        });

        return balances.map((member) => ({
          ...member,
          balance: member.paid - member.owes,
        }));
      },

      getUserTotalBalance: (userName) => {
        const groups = get().groups;
        let totalBalance = 0;

        groups.forEach((group) => {
          const balances = get().calculateMemberBalances(group.id);
          const userBalance = balances.find((b) => b.name === userName);
          if (userBalance) {
            totalBalance += userBalance.balance;
          }
        });

        return totalBalance;
      },

      getUserGroupBalances: (userName) => {
        return get().groups.map((group) => {
          const balances = get().calculateMemberBalances(group.id);
          const userBalance = balances.find((b) => b.name === userName);
          return {
            groupId: group.id,
            groupName: group.name,
            balance: userBalance ? userBalance.balance : 0,
          };
        });
      },
    }),
    {
      name: "group-storage",
      storage: {
        getItem: async (name) => {
          const data = await AsyncStorage.getItem(name);
          return data ? JSON.parse(data) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);