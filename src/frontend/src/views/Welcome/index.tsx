import { useRouter } from "next/router";
import { useEffect } from "react";
import { HeadAppTitle } from "src/common/components";
import { setGroup } from "src/common/redux/actions";
import { useDispatch } from "src/common/redux/hooks";
import { ROUTES } from "src/common/routes";

const Welcome = (): JSX.Element => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { groupId } = router.query;
  const groupIdInt = parseInt(groupId as string);

  useEffect(() => {
    if (groupIdInt) {
      dispatch(setGroup(groupIdInt));
    }

    router.push(ROUTES.DATA);
  }, [groupIdInt, dispatch, router]);

  return <HeadAppTitle subTitle="Welcome to CZ Gen Epi!" />;
};

export default Welcome;
