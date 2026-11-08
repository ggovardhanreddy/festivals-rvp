-- Optional starter content. Replace placeholder copy with community-verified facts.
insert into public.content_items(slug,title,summary,body,category,published,featured)
values
('welcome-to-reddivaripalli','Welcome to Reddivaripalli','A digital home for our village, its people and traditions.','This is the community archive for Reddivaripalli. Add verified village history, photographs, temple details and community memories through the admin dashboard.','village',true,true),
('share-your-memories','Help preserve our shared memories','Contribute approved photographs, stories and historical records.','The village archive grows through community contributions. Please submit material only when you have permission to share it.','news',false,false)
on conflict(category,slug) do nothing;
