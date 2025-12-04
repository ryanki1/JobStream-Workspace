using Microsoft.EntityFrameworkCore;
using JobStream.Api.Models;

namespace JobStream.Api.Data;

public class JobStreamDbContext : DbContext
{
    public JobStreamDbContext(DbContextOptions<JobStreamDbContext> options)
        : base(options)
    {
    }

    public DbSet<CompanyRegistration> CompanyRegistrations => Set<CompanyRegistration>();
    public DbSet<RegistrationDocument> RegistrationDocuments => Set<RegistrationDocument>();
    public DbSet<JobPosting> JobPostings => Set<JobPosting>();
    public DbSet<MLVerificationResult> MLVerificationResults => Set<MLVerificationResult>();
    public DbSet<User> Users => Set<User>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure CompanyRegistration entity
        modelBuilder.Entity<CompanyRegistration>(entity =>
        {
            entity.ToTable("CompanyRegistrations");

            // Primary key
            entity.HasKey(e => e.Id);

            // Indexes for performance
            entity.HasIndex(e => e.CompanyEmail)
                .IsUnique();

            entity.HasIndex(e => e.Status);

            entity.HasIndex(e => e.CreatedAt);

            entity.HasIndex(e => e.EmailVerificationToken);

            entity.HasIndex(e => e.ExpiresAt);

            // Convert enum to string for storage
            entity.Property(e => e.Status)
                .HasConversion<string>();

            // Default values
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()");

            // Decimal precision for StakeAmount
            entity.Property(e => e.StakeAmount)
                .HasPrecision(18, 2);

            // Configure one-to-many relationship
            entity.HasMany(e => e.Documents)
                .WithOne(d => d.CompanyRegistration)
                .HasForeignKey(d => d.CompanyRegistrationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure RegistrationDocument entity
        modelBuilder.Entity<RegistrationDocument>(entity =>
        {
            entity.ToTable("RegistrationDocuments");

            // Primary key
            entity.HasKey(e => e.Id);

            // Indexes for performance
            entity.HasIndex(e => e.CompanyRegistrationId);

            entity.HasIndex(e => e.DocumentType);

            entity.HasIndex(e => e.UploadedAt);

            // Default values
            entity.Property(e => e.UploadedAt)
                .HasDefaultValueSql("now()");
        });

        // Configure JobPosting entity
        modelBuilder.Entity<JobPosting>(entity =>
        {
            entity.ToTable("JobPostings");

            // Primary key
            entity.HasKey(e => e.Id);

            // Indexes for performance
            entity.HasIndex(e => e.CompanyId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.PublishedAt);
            entity.HasIndex(e => e.BlockchainPostingId);

            // Convert enum to string for storage
            entity.Property(e => e.Status)
                .HasConversion<string>();

            // Default values
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()");

            // JSON columns are stored as TEXT in PostgreSQL
            entity.Property(e => e.RequiredSkillsJson)
                .HasColumnType("TEXT");

            entity.Property(e => e.PaymentStructureJson)
                .HasColumnType("TEXT");
        });

        // Configure MLVerificationResult entity
        modelBuilder.Entity<MLVerificationResult>(entity =>
        {
            entity.ToTable("MLVerificationResults");

            // Primary key
            entity.HasKey(e => e.Id);

            // Indexes for performance
            entity.HasIndex(e => e.RegistrationId);
            entity.HasIndex(e => e.RiskLevel);
            entity.HasIndex(e => e.VerifiedAt);

            // Foreign key relationship
            entity.HasOne(e => e.Registration)
                .WithMany()
                .HasForeignKey(e => e.RegistrationId)
                .OnDelete(DeleteBehavior.Cascade);

            // Convert enum to string for storage
            entity.Property(e => e.RiskLevel)
                .HasConversion<string>();

            // Decimal precision
            entity.Property(e => e.OverallRiskScore)
                .HasPrecision(5, 2); // 0-100 with 2 decimal places

            entity.Property(e => e.Confidence)
                .HasPrecision(3, 2); // 0-1 with 2 decimal places

            // JSON columns stored as TEXT
            entity.Property(e => e.WebIntelligenceJson)
                .HasColumnType("TEXT");

            entity.Property(e => e.SentimentAnalysisJson)
                .HasColumnType("TEXT");

            entity.Property(e => e.RiskFlagsJson)
                .HasColumnType("TEXT");

            entity.Property(e => e.RecommendationsJson)
                .HasColumnType("TEXT");

            // Default value
            entity.Property(e => e.VerifiedAt)
                .HasDefaultValueSql("now()");
        });

        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");

            // Primary key
            entity.HasKey(e => e.Id);

            // Indexes for performance
            entity.HasIndex(e => e.Email)
                .IsUnique();

            entity.HasIndex(e => e.Role);

            entity.HasIndex(e => e.CompanyRegistrationId);

            entity.HasIndex(e => e.CreatedAt);

            // Convert enum to string for storage
            entity.Property(e => e.Role)
                .HasConversion<string>();

            // Default values
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()");

            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);

            entity.Property(e => e.EmailVerified)
                .HasDefaultValue(false);

            // Foreign key relationship to CompanyRegistration (optional)
            entity.HasOne(e => e.CompanyRegistration)
                .WithMany()
                .HasForeignKey(e => e.CompanyRegistrationId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Configure PasswordResetToken entity
        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.ToTable("PasswordResetTokens");

            // Primary key
            entity.HasKey(e => e.Id);

            // Indexes for performance
            entity.HasIndex(e => e.Token)
                .IsUnique();

            entity.HasIndex(e => e.UserId);

            entity.HasIndex(e => e.ExpiresAt);

            entity.HasIndex(e => e.Used);

            // Default values
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()");

            entity.Property(e => e.Used)
                .HasDefaultValue(false);

            // Foreign key relationship to User
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure AuditLog entity
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("AuditLogs");

            // Primary key
            entity.HasKey(e => e.Id);

            // Indexes for performance
            entity.HasIndex(e => e.CompanyRegistrationId);

            entity.HasIndex(e => e.Action);

            entity.HasIndex(e => e.Timestamp);

            entity.HasIndex(e => e.PerformedBy);

            // Convert enum to string for storage
            entity.Property(e => e.Action)
                .HasConversion<string>();

            // Default value
            entity.Property(e => e.Timestamp)
                .HasDefaultValueSql("now()");

            // JSON column stored as TEXT
            entity.Property(e => e.DetailsJson)
                .HasColumnType("TEXT");

            // Foreign key relationship to CompanyRegistration
            entity.HasOne(e => e.CompanyRegistration)
                .WithMany()
                .HasForeignKey(e => e.CompanyRegistrationId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
