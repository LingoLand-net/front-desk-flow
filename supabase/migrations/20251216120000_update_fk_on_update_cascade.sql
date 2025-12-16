-- Ensure foreign keys have ON UPDATE CASCADE to prevent orphan references on ID changes
-- Note: Postgres requires dropping and recreating constraints to change actions.

-- student_groups.student_id
ALTER TABLE public.student_groups
  DROP CONSTRAINT IF EXISTS student_groups_student_id_fkey;
ALTER TABLE public.student_groups
  ADD CONSTRAINT student_groups_student_id_fkey
  FOREIGN KEY (student_id)
  REFERENCES public.students(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- student_groups.group_id
ALTER TABLE public.student_groups
  DROP CONSTRAINT IF EXISTS student_groups_group_id_fkey;
ALTER TABLE public.student_groups
  ADD CONSTRAINT student_groups_group_id_fkey
  FOREIGN KEY (group_id)
  REFERENCES public.groups(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- discounts.student_id
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discounts' AND table_schema = 'public') THEN
    ALTER TABLE public.discounts
      DROP CONSTRAINT IF EXISTS discounts_student_id_fkey;
    ALTER TABLE public.discounts
      ADD CONSTRAINT discounts_student_id_fkey
      FOREIGN KEY (student_id)
      REFERENCES public.students(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE;
  END IF;
END $$;

-- discounts.linked_student_id (family discount)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discounts' AND table_schema = 'public') THEN
    ALTER TABLE public.discounts
      DROP CONSTRAINT IF EXISTS discounts_linked_student_id_fkey;
    ALTER TABLE public.discounts
      ADD CONSTRAINT discounts_linked_student_id_fkey
      FOREIGN KEY (linked_student_id)
      REFERENCES public.students(id)
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;

-- payments.student_id
ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_student_id_fkey;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_student_id_fkey
  FOREIGN KEY (student_id)
  REFERENCES public.students(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- payments.group_id: keep SET NULL on delete; add ON UPDATE CASCADE
ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_group_id_fkey;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_group_id_fkey
  FOREIGN KEY (group_id)
  REFERENCES public.groups(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- attendance.student_id
ALTER TABLE public.attendance
  DROP CONSTRAINT IF EXISTS attendance_student_id_fkey;
ALTER TABLE public.attendance
  ADD CONSTRAINT attendance_student_id_fkey
  FOREIGN KEY (student_id)
  REFERENCES public.students(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- attendance.group_id
ALTER TABLE public.attendance
  DROP CONSTRAINT IF EXISTS attendance_group_id_fkey;
ALTER TABLE public.attendance
  ADD CONSTRAINT attendance_group_id_fkey
  FOREIGN KEY (group_id)
  REFERENCES public.groups(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- groups.teacher_id: keep SET NULL on delete; add ON UPDATE CASCADE
ALTER TABLE public.groups
  DROP CONSTRAINT IF EXISTS groups_teacher_id_fkey;
ALTER TABLE public.groups
  ADD CONSTRAINT groups_teacher_id_fkey
  FOREIGN KEY (teacher_id)
  REFERENCES public.teachers(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;
