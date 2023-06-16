import { Subscription, UserDetails } from "@/types";
import { User } from "@supabase/auth-helpers-nextjs";
import {
  useSessionContext,
  useUser as useSupaUser,
} from "@supabase/auth-helpers-react";
import { createContext, useContext, useEffect, useState } from "react";

// Define the type of the UserContext value
type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  subscription: Subscription | null;
};

// Create the UserContext with an initial value of undefined
export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export interface Props {
  [propName: string]: any;
}

// Create the MyUserContextProvider component
export const MyUserContextProvider = (props: Props) => {
  // Obtain session, user, and Supabase client using custom hooks
  const {
    session,
    isLoading: isLoadingUser,
    supabaseClient: supabase,
  } = useSessionContext();
  const user = useSupaUser();
  const accessToken = session?.access_token ?? null;

  // Manage loading state and user details/subscriptions
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  // Helper function to fetch user details from Supabase
  const getUserDetails = () => supabase.from("users").select("*").single();

  // Helper function to fetch subscription details from Supabase
  const getSubscription = () =>
    supabase
      .from("subscriptions")
      .select("*, prices(*, products(*))")
      .in("status", ["trialing", "active"])
      .single();

  // Effect hook to fetch user details and subscriptions when necessary
  useEffect(() => {
    // When the user is authenticated and necessary data is not yet loaded
    if (user && !isLoadingData && !userDetails && !subscription) {
      setIsLoadingData(true);
      Promise.allSettled([getUserDetails(), getSubscription()]).then(
        (results) => {
          const userDetailsPromise = results[0];
          const subscriptionPromise = results[1];

          // If user details promise is fulfilled, update state with the data
          if (userDetailsPromise.status === "fulfilled")
            setUserDetails(userDetailsPromise.value.data as UserDetails);

          // If subscription promise is fulfilled, update state with the data
          if (subscriptionPromise.status === "fulfilled")
            setSubscription(subscriptionPromise.value.data as Subscription);

          setIsLoadingData(false);
        }
      );
      // When the user is not authenticated and there is no loading in progress
    } else if (!user && !isLoadingUser && !isLoadingData) {
      setUserDetails(null);
      setSubscription(null);
    }
  }, [user, isLoadingUser]);

  // Create the value object with the necessary properties
  const value = {
    accessToken,
    user,
    userDetails,
    isLoading: isLoadingUser || isLoadingData,
    subscription,
  };

  // Provide the UserContext value to the child components
  return <UserContext.Provider value={value} {...props} />;
};

// Custom hook to access the UserContext value
export const useUser = () => {
  const context = useContext(UserContext);

  // Throw an error if used outside of a MyUserContextProvider component
  if (context === undefined) {
    throw new Error("useUser must be used within a MyUserContextProvider");
  }
  return context;
};
