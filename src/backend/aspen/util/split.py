from splitio import get_factory
from splitio.client.client import Client as SplitioClient
from splitio.exceptions import TimeoutException

from aspen.database.models import Group, User


class SplitClient:
    split_config = {
        "featuresRefreshRate": 15,
        "IPAddressesEnabled": False,
        "labelsEnabled": True,
        "splitFile": "etc/split.yml",
    }

    def __init__(self, settings):
        factory = get_factory(settings.SPLIT_BACKEND_KEY, config=self.split_config)
        try:
            factory.block_until_ready(5)  # wait up to 5 seconds
        except TimeoutException:
            # Here we're ignoring the error and proceeding without a ready client,
            # which if configured properly, should become ready at some point.
            pass
        self.split_factory = factory
        self.split_client: SplitioClient = factory.client()

    def generate_parameters(self, user, group):
        user_parameters = {"user_id": user.split_id, "group_id": group.id}
        return user_parameters

    def get_flag(self, user: User, group: Group, treatment):
        parameters = self.generate_parameters(user, group)
        treatment = self.split_client.get_treatment(
            user.split_id, treatment, parameters
        )
        return treatment
