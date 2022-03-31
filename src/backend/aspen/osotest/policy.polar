allow(user: User, "read", sample: Sample) if
    sample.submitting_group = user.group;

allow(_: User, "read", _: User);
