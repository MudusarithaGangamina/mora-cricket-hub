using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MoraCricketHub.Domain.Entities;

namespace MoraCricketHub.Infrastructure.Persistence.Configurations;

public class TournamentConfiguration : IEntityTypeConfiguration<Tournament>
{
    public void Configure(EntityTypeBuilder<Tournament> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Name).HasMaxLength(150).IsRequired();
        builder.Property(t => t.Format).HasMaxLength(10).IsRequired();
        builder.HasIndex(t => t.SeasonId);

        builder.HasOne(t => t.Season)
            .WithMany(s => s.Tournaments)
            .HasForeignKey(t => t.SeasonId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
