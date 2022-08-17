from aspen.api.settings import Settings
from aspen.database.models.pathogens import Pathogen
from aspen.util.split import SplitClient


def create_test_pathogen():
    return Pathogen(slug="SC2", name="SARS-CoV-2")


def test_treatments():
    # test that treatments are returned correctly based on traffic type
    pathogen = Pathogen(slug="SC2", name="SARS-CoV-2")
    settings = Settings()
    splitio = SplitClient(settings)

    treatment = splitio.get_pathogen_flag("pathogen_feature", pathogen)
    assert treatment == "on"

    pathogen.slug = "MPX"
    treatment = splitio.get_pathogen_flag("pathogen_feature", pathogen)
    assert treatment == "control"  # this is the default
