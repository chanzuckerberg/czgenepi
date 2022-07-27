import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { HeadAppTitle } from "src/common/components";
import { useProtectedRoute } from "src/common/queries/auth";
import { setGroup } from "src/common/redux/actions";
import { useDispatch } from "src/common/redux/hooks";
import { ROUTES } from "src/common/routes";

const Welcome = (): JSX.Element => {
  useProtectedRoute();

  const router = useRouter();
  const { groupId } = router.query;

  const dispatch = useDispatch();

  useEffect(() => {
    if (groupId) {
      dispatch(setGroup(groupId));
    }

    router.push(ROUTES.DATA);
  }, [groupId, dispatch, router]);

  return <HeadAppTitle subTitle="Welcome to CZ Gen Epi!" />;
};

export default Welcome;
