from aspen.api.settings import APISettings
from aspen.test_infra.models.pathogen import pathogen_factory
from aspen.util.split import SplitClient


def test_pathogen_treatments():
    # test that treatments are returned correctly based on traffic type

    pathogen = pathogen_factory("SC2", "SARS-CoV-2")
    settings = APISettings()
    splitio = SplitClient(settings)

    flag_to_treatments = {
        "PATHOGEN_lineage_caller": {
            "SC2": "Pangolin",
            "MPX": "ncov",
            # SFO entry is to check that default is returned if mystery pathogen
            "SFO": "ncov",
        },
        "PATHOGEN_galago_linkout": {"SC2": "on", "MPX": "off", "SFO": "off"},
        "PATHOGEN_lineage_filter_enabled": {"SC2": "on", "MPX": "off", "SFO": "off"},
        "PATHOGEN_public_repository": {
            "SC2": "GISAID",
            "MPX": "GenBank",
            "SFO": "GenBank",
        },
        "PATHOGEN_usher_linkout": {"SC2": "on", "MPX": "off", "SFO": "off"},
    }

    for flag, slug_to_treatment in flag_to_treatments.items():
        for slug, expected_treatment in slug_to_treatment.items():
            pathogen.slug = slug
            treatment = splitio.get_pathogen_treatment(flag, pathogen)
            assert treatment == expected_treatment
