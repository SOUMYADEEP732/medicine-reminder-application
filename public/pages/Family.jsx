
import React from "react";
import { Users, UserPlus } from "lucide-react";
import FamilyCard from "../components/FamilyCard";

export default function Family({ family, onInvite }) {

  const membersWithData = family.filter(
    member => member.adherence != null
  );

  const average = membersWithData.length
    ? Math.round(
        membersWithData.reduce(
          (total, member) =>
            total + member.adherence,
          0
        ) / membersWithData.length
      )
    : 0;

  return (
    <>
      <section className="family-hero">

        <div className="family-hero-icon">
          <Users size={25} />
        </div>

        <div>
          <span>Care circle</span>

          <h2>
            {family.length} family members
          </h2>

          <p>
            Average medication adherence is{" "}
            <strong>{average}%</strong>.
          </p>
        </div>

        <button
          className="secondary-btn"
          onClick={onInvite}
        >
          <UserPlus size={17} />
          Invite member
        </button>

      </section>

      <section className="content-card full-card">

        <div className="section-head">
          <div>
            <h2>Family members</h2>

            <p>
              View each member's adherence rate
              and the doses they have missed.
            </p>
          </div>
        </div>

        <div className="family-list family-grid">

          {family.map(member => (
            <FamilyCard
              key={member.id}
              member={member}
            />
          ))}

        </div>

      </section>
    </>
  );
}
