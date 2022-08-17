from typing import Dict, Optional

from splitio import get_factory
from splitio.client.client import Client as SplitioClient
from splitio.exceptions import TimeoutException

from aspen.database.models import Group, User
from aspen.database.models.pathogens import Pathogen


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

    def generate_parameters(self, user: User, group: Optional[Group]):
        params = {"user_id": user.split_id}
        if group:
            params["group_id"] = group.id
        return params

    def get_usergroup_treatment(
        self, feature: str, user: User, group: Optional[Group] = None
    ):

        parameters = self.generate_parameters(user, group)
        treatment = self.split_client.get_treatment(user.split_id, feature, parameters)
        return treatment

    def get_pathogen_treatment(self, feature: str, pathogen: Pathogen):
        # feature refers to a functionality block (split) ex: usher_enabled, public_repository

        # params is empty for now, but we may want to use it later to make more complicated desicions with split.
        params: Dict[str, str] = {}
        treatment = self.split_client.get_treatment(pathogen.slug, feature, params)
        return treatment
