allow(actor, action, resource) if
  has_permission(actor, action, resource);

actor AuthContext { }

resource Sample {
  roles = ["admin", "viewer", "member"];
  permissions = [ "read", "read_private", "read_public", "sequences", "write"];
  relations = { owner: Group };

  "viewer" if "viewer" on "owner";
  "member" if "member" on "owner";
  "admin" if "admin" on "owner";

  # viewer permissions
  "read_public" if "viewer";
  # admin permissions
  "read_public" if "admin";
  "read_private" if "admin";
  "sequences" if "admin";
  "write" if "admin";
  # member permissions
  "read_public" if "member";
  "read_private" if "member";
  "sequences" if "member";
  "write" if "member";
}

resource Group {
  roles = ["admin", "viewer", "member"];
  permissions = ["read", "write", "create_phylorun", "create_sample"];

  # admin permissions
  "read" if "admin";
  "write" if "admin";
  "create_phylorun" if "admin";
  "create_sample" if "admin";
  # member permissions
  "read" if "member";
  "create_phylorun" if "member";
  "create_sample" if "member";
}

resource PhyloRun {
  roles = ["admin", "viewer", "member"];
  permissions = ["read", "write"];
  relations = { owner: Group };

  "viewer" if "viewer" on "owner";
  "member" if "member" on "owner";
  "admin" if "admin" on "owner";

  # viewer permissions
  "read" if "viewer";
  # admin permissions
  "read" if "admin";
  # member permissions
  "read" if "member";
  "write" if "member";
}

resource PhyloTree {
  roles = ["admin", "viewer", "member"];
  permissions = ["read", "write"];
  relations = { owner: Group };

  "viewer" if "viewer" on "owner";
  "member" if "member" on "owner";
  "admin" if "admin" on "owner";

  # viewer permissions
  "read" if "viewer";
  # admin permissions
  "read" if "admin";
  # member permissions
  "read" if "member";
  "write" if "member";
}

has_permission(ac: AuthContext, "read", sample: Sample) if
  has_permission(ac, "read_private", sample) or (
    has_permission(ac, "read_public", sample) and
    sample.private = false
  );

has_role(ac: AuthContext, name: String, group: Group) if
    (name in ac.user_roles and
    group.id = ac.group.id) or (
        grole in ac.group_roles and
        grole.role = name and
        grole.group_id = group.id
    );

has_relation(group: Group, "owner", phylo_run: PhyloRun) if phylo_run.group = group;
has_relation(group: Group, "owner", sample: Sample) if sample.submitting_group = group;
has_relation(group: Group, "owner", phylotree: PhyloTree) if phylotree.group = group;
