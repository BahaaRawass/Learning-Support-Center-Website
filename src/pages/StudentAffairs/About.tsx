import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function About() {
  useDocumentTitle("Workstudy Program");

  return (
    <>
      <h1 className="page-title">Work Study Program</h1>
      <p className="page-desc">
        RHU offers a limited number of student employment opportunities under
        the Work Study Program every semester. The Work Study Program provides
        limited financial support and an opportunity to attain practical
        experience to qualified students in return for specific tasks they
        perform in areas related to their field of study. Participating in the
        Work-Study Program helps prepare students for life after college, and
        puts them in the general atmosphere of how to work through their domain
        or major. Students who participate in the Work Study Program are subject
        to the rules and regulations stated by their supervisor.
      </p>

      <Accordion type="single" collapsible>
        <AccordionItem value="Policies">
          <AccordionTrigger className="text-(--navy) font-bold text-2xl">
            <h3>Policies</h3>
          </AccordionTrigger>
          <AccordionContent className="text-lg">
            <ul className="list-disc list-inside">
              <li>
                Work Study (WS) employment is open to students who meet the
                eligibility criteria only.
              </li>
              <li>
                Work assignment is limited to a maximum of 8 hours per week at a
                rate of 9,000 LBP/hour.
              </li>
              <li>
                Applications must be received at the Student Affairs Office
                (SAO) by the end of the fall (spring) for spring (fall) and
                summer semester employment by the announced deadlines.
              </li>
              <li>
                Students granted WS employment are required to attend an
                orientation session on work-study policies and procedures and to
                sign a WS Assignment form.
              </li>
              <li>
                The SAO shall maintain records of all student work study
                activities.
              </li>
              <li>
                A work supervisor shall be designated to each student on a WS
                assignment to ensure that student is accomplishing the required
                tasks.
              </li>
              <li>
                The work supervisor submits to the SAO interim Work Study
                Reports on the accomplished tasks twice per semester, and after
                verifying them the SAO forwards the reports to the Finance
                Department for payment.
              </li>
              <li>
                Student performance shall be evaluated continuously to decide on
                continuance of work-study privileges.
              </li>
              <li>
                A WS recipient shall not be assigned the task of grading
                students’ work or proctoring exams.
              </li>
              <li>
                Priority of WS assignments shall be given to those who do not
                benefit from other financial tools.
              </li>
              <li>
                The number of WS hours usually assigned to a student is
                proportionate with his/her CGPA as follows:
                <ul className="list-disc list-inside">
                  <li>70 &lt; CGPA &lt; 74.99, 50 hours</li>
                  <li>75 &lt; CGPA &lt; 79.99, 60 hours</li>
                  <li>CGPA &gt; 80, 70 hours</li>
                </ul>
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="Eligibility Requirement">
          <AccordionTrigger className="text-(--navy) font-bold text-2xl">
            <h3>Eligibility Requirement</h3>
          </AccordionTrigger>
          <AccordionContent className="text-lg">
            <p>
              To be eligible to apply for the RHU’s Work Study Program, the
              applicant must satisfy the following conditions:
            </p>
            <ul className="list-disc list-inside">
              <li>
                Is in good academic standing with a minimum cumulative GPA of
                70%.
              </li>
              <li>
                Has earned a minimum of 12 credits by the term of employment
              </li>
              <li>
                Has completed previously awarded work study appointment
                satisfactorily (if applicable)
              </li>
              <li>Has completed at least one semester of study at RHU</li>
              <li>
                Has not been subject to any disciplinary action for violating
                University rules
              </li>
            </ul>
            <p>&nbsp;</p>
            <p>
              Meeting the above requirement does not guarantee a work study
              assignment. Other factors, such as financial need and the
              availability of funds, are also taken into consideration.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="Application Process">
          <AccordionTrigger className="text-(--navy) font-bold text-2xl">
            <h3>Application Process</h3>
          </AccordionTrigger>
          <AccordionContent className="text-lg">
            <p>
              Applicants to the Work Study Program must submit by the stated
              deadlines to the Student Affairs Office the following documents:
            </p>
            <ul className="list-disc list-inside">
              <li>A completed Work Study Application Form</li>
            </ul>
            <div>
              <div>
                <div>Work Study Application Form</div>
              </div>
              <div>
                <a
                  href="https://www.rhu.edu.lb/Library/Assets/Gallery/Files/WorkStudyApplicationForm.pdf"
                  target="_blank"
                >
                  Download PDF
                </a>
              </div>
            </div>
            <div>
              <div>
                <div>Work Study Summer Application Form</div>
              </div>
              <div>
                <a
                  href="https://www.rhu.edu.lb/Library/Assets/Gallery/Files/WorkStudyApplicationFormSummer.pdf"
                  target="_blank"
                >
                  Download PDF
                </a>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="Selection Process">
          <AccordionTrigger className="text-(--navy) font-bold text-2xl">
            <h3>Selection Process</h3>
          </AccordionTrigger>
          <AccordionContent className="text-lg">
            <ul className="list-disc list-inside">
              <li>
                Before the end of the prior semester, the SAO announces the
                deadline to apply for the work-study program for the following
                semester. Academic or administrative staff members may identify
                and convince eligible students to apply for the program and
                indicate their preferred work assignment on the application
                form. Their request shall be communicated to the SAO by email
                before the assigned deadline.
              </li>
              <li>
                The college deans and administrative unit directors submit to
                the SAO their requests for the number of work-study awards they
                need before the beginning of a semester.
              </li>
              <li>
                Applications are reviewed, and WS grants are awarded to the
                applicants who meet the eligibility criteria, pending
                availability of funds.
              </li>
              <li>
                The SAO coordinates with the various departments and units for
                the final work assignments of approved applicants.
              </li>
              <li>
                Students granted employment are informed of the decision and
                called in to attend an orientation session on work-study
                policies, procedures, rights, and responsibilities.
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="Disqualification Process">
          <AccordionTrigger className="text-(--navy) font-bold text-2xl">
            <h3 className="depTitle">Disqualification Process</h3>
          </AccordionTrigger>
          <AccordionContent className="text-lg">
            <p>Work Study privilege will be revoked if the student:</p>
            <ul className="list-disc list-inside">
              <li>Violates University rules and regulations</li>
              <li>
                Violates confidentiality policy or commits a breach of trust
                while on assignment
              </li>
              <li>
                Attempt to search for or divulge any classified information
                beyond task requirements
              </li>
              <li>Does not fulfill assigned duties as required</li>
              <li>
                Receives a disciplinary probation as a result of misconduct
              </li>
              <li>
                Had intentionally presented false evidence or misleading
                statements on the application
              </li>
              <li>
                Any violation of the work-study agreement may disqualify the
                student from any future employment opportunity at RHU.
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}
