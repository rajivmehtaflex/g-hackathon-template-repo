insert into public.projects (
  title,
  description,
  status,
  progress,
  owner_name,
  is_demo
) values
  (
    'Pitch Sprint',
    'Turn a rough idea into a launch-ready landing page with AI support.',
    'Building',
    68,
    'Starter Seed',
    true
  ),
  (
    'Feedback Radar',
    'Collect prioritized feature requests and ship in weekly cycles.',
    'Idea',
    24,
    'Starter Seed',
    true
  ),
  (
    'Demo Metrics',
    'Track onboarding and conversion signals from each session.',
    'Launched',
    91,
    'Starter Seed',
    true
  );

insert into public.project_updates (project_id, event)
select p.id, event.event
from public.projects p
cross join lateral (
  values
    (p.title || ' generated seed plan.'),
    (p.title || ' created by seed flow.'),
    (p.title || ' marked as public demo.')
) event(event)
where p.is_demo
;
