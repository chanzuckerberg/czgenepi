from splitio import get_factory
from splitio.client.client import Client as SplitioClient
from splitio.exceptions import TimeoutException


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

    def generate_parameters(self, user):
        user_parameters = {"user_id": user.id, "group_id": user.group.id}
        return user_parameters

    def get_flag(self, user, treatment):
        parameters = self.generate_parameters(user)
        treatment = self.split_client.get_treatment(user.id, treatment, parameters)
        return treatment
