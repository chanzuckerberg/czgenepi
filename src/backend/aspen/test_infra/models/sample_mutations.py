from aspen.database.models import MutationsCaller, SampleMutation


def sample_mutations_factory(
    sample,
    mutations_caller=MutationsCaller.NEXTCLADE,
    substitutions="T1234C,A4567G",
    insertions="123:AACCTTGG,456:GCTCT",
    deletions="45-65,333,3443-3555",
    aa_substitutions="OPG1234:F591V",
    aa_insertions="OPG455:466:WNGMG",
    aa_deletions="OPG033:R123-,OPG066:Q60-",
    reference_sequence_accession="REF_SEQ_TEST",
):
    return SampleMutation(
        sample=sample,
        mutations_caller=mutations_caller,
        substitutions=substitutions,
        insertions=insertions,
        deletions=deletions,
        aa_substitutions=aa_substitutions,
        aa_insertions=aa_insertions,
        aa_deletions=aa_deletions,
        reference_sequence_accession=reference_sequence_accession,
    )
