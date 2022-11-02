from aspen.util.lineage import expand_lineage_wildcards


def test_expand_lineage_aliases():
    MOCKED_ALL_LINEAGES = {
        # Delta lineages
        "B.1.617.2",
        "AY.1",
        "AY.2",
        # Omicron lineages
        "B.1.1.529",
        "BA.1",
        "BA.1.1",
        "BA.2",
        "BA.3",
        "BA.4",
        "BA.5",
        # Other
        "B.1.1.7",
    }
    input_lineages = ["Delta", "BA.1* / 21K", "B.1.1.7"]
    result = expand_lineage_wildcards(MOCKED_ALL_LINEAGES, input_lineages)
    # Result order is meaningless, just need to verify sets match up.
    expected_linages = set(["B.1.617.2", "AY.1", "AY.2", "BA.1", "BA.1.1", "B.1.1.7"])
    assert set(result) == expected_linages


def test_expand_lineage_wildcard():
    MOCKED_ALL_LINEAGES = {
        # Delta lineages
        "B.1.617.2",
        "AY.1",
        "AY.2",
        # Omicron lineages
        "B.1.1.529",
        "BA.1",
        "BA.1.1",
        "BA.2",
        "BA.3",
        "BA.4",
        "BA.5",
        # Other
        "B.1.1.7",
    }
    input_lineages = ["BA.1*"]
    result = expand_lineage_wildcards(MOCKED_ALL_LINEAGES, input_lineages)
    # Result order is meaningless, just need to verify sets match up.
    expected_linages = set(["BA.1", "BA.1.1"])
    assert set(result) == expected_linages
